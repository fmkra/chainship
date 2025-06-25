import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useNotificationStore } from '../atomic/Toaster'
import { useState } from 'react'
import Input from '../atomic/Input'
import Button from '../atomic/Button'
import { cn } from '../utils'

export const CHAINS = {
    1: 'Ethereum Mainnet',
    11155111: 'Ethereum Sepolia',
    31337: 'Localhost',
    123123: 'Filip Local Node',
}

const defaultChainId = 1 as ChainId

type ChainId = keyof typeof CHAINS

const defaultContracts = [
    {
        id: crypto.randomUUID(),
        chainId: 31337,
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
    {
        id: crypto.randomUUID(),
        chainId: 11155111,
        address: '0x0058F477eF9c4d4EE3992078ec8cFe2Dd8a7dE3f',
    },
] satisfies Contract[]

interface Contract {
    id: string
    chainId: ChainId
    address: string
}

interface ContractStorageState {
    contracts: Contract[]
    selectedContractId: string | null
    isModalOpen: boolean
}

interface ContractStorageActions {
    getSelectedContract: () => Contract | null
    getConfig: () => { address: `0x${string}`; chainId: ChainId } | null
    addContract: (contract: Omit<Contract, 'id'>) => void
    updateContract: (updatedContract: Contract) => void
    deleteContract: (id: string) => void
    selectContract: (id: string) => void
    openModal: () => void
    closeModal: () => void
    initialCheck: () => void
}

export const useContractStorage = create<ContractStorageState & ContractStorageActions>()(
    persist(
        (set, get) => ({
            contracts: defaultContracts,
            selectedContractId: null,
            isModalOpen: true,

            getSelectedContract: () => {
                const state = get()
                const selectedContract = state.contracts.find((c) => c.id === state.selectedContractId)
                if (!selectedContract) return null
                return selectedContract
            },
            getConfig: () => {
                const state = get()
                const selectedContract = state.contracts.find((c) => c.id === state.selectedContractId)
                if (!selectedContract) return null
                return {
                    address: selectedContract.address as `0x${string}`,
                    chainId: selectedContract.chainId,
                }
            },
            addContract: (contract) =>
                set((state) => ({
                    contracts: [...state.contracts, { ...contract, id: crypto.randomUUID() }],
                })),
            updateContract: (updatedContract) =>
                set((state) => ({
                    contracts: state.contracts.map((c) => (c.id === updatedContract.id ? updatedContract : c)),
                })),
            deleteContract: (id) =>
                set((state) => {
                    const newContracts = state.contracts.filter((c) => c.id !== id)
                    const newSelectedContractId =
                        state.selectedContractId === id
                            ? newContracts.length > 0
                                ? newContracts[0].id
                                : null
                            : state.selectedContractId
                    return { contracts: newContracts, selectedContractId: newSelectedContractId }
                }),
            selectContract: (id) => set({ selectedContractId: id }),
            openModal: () => set({ isModalOpen: true }),
            closeModal: () => {
                const { getSelectedContract } = get()
                if (getSelectedContract()) {
                    set({ isModalOpen: false })
                } else {
                    useNotificationStore
                        .getState()
                        .addNotification('You must select a contract before closing.', 'error')
                }
            },
            initialCheck: () => {
                if (!get().getSelectedContract()) {
                    set({ isModalOpen: true })
                }
            },
        }),
        {
            name: 'contract-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

interface ContractFormProps {
    onSave: (contract: Omit<Contract, 'id'>) => void
    onCancel: () => void
    contract?: Contract
}

const ContractForm = ({ onSave, onCancel, contract }: ContractFormProps) => {
    const [chainId, setChainId] = useState<ChainId>(contract?.chainId ?? defaultChainId)
    const [contractAddress, setContractAddress] = useState<string>(contract?.address || '')
    const [error, setError] = useState<string>('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!chainId || !contractAddress) {
            setError('Both fields are required.')
            return
        }
        onSave({ ...contract, chainId, address: contractAddress })
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-100 rounded-lg space-y-4">
            <h3 className="text-lg font-bold">{contract ? 'Edit Contract' : 'Add New Contract'}</h3>
            <div>
                <label htmlFor="chain-id" className="block text-sm font-semibold text-slate-700">
                    Chain ID
                </label>
                <select
                    id="chain-id"
                    value={chainId}
                    onChange={(e) => setChainId(Number(e.target.value) as ChainId)}
                    className="mt-1 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200"
                >
                    <option value="" disabled>
                        Select a chain
                    </option>
                    {Object.entries(CHAINS).map(([chainId, chainName]) => (
                        <option key={chainId} value={chainId}>
                            {chainName}
                        </option>
                    ))}
                </select>
            </div>
            <Input
                label="Contract Address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                error={error && !contractAddress ? 'Contract address is required.' : ''}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="gray" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="green">
                    {contract ? 'Save Changes' : 'Add Contract'}
                </Button>
            </div>
        </form>
    )
}

const ContractList = () => {
    const { contracts, selectedContractId, selectContract, deleteContract, addContract, updateContract } =
        useContractStorage()
    const [isAdding, setIsAdding] = useState<boolean>(false)
    const [editingChainId, setEditingChainId] = useState<string | null>(null)
    const { addNotification } = useNotificationStore()

    const handleSave = (contractData: Omit<Contract, 'id'> & { id?: string }) => {
        if (contractData.id) {
            // Editing
            updateContract(contractData as Contract)
            addNotification(`Contract "${contractData.chainId}" updated successfully!`, 'success')
            setEditingChainId(null)
        } else {
            // Adding
            addContract(contractData)
            addNotification(`Contract "${contractData.chainId}" added successfully!`, 'success')
            setIsAdding(false)
        }
    }

    const handleDelete = (id: string, address: string) => {
        if (confirm(`Are you sure you want to delete the ${address} contract?`)) {
            deleteContract(id)
            addNotification(`Contract "${address}" deleted.`, 'info')
        }
    }

    return (
        <div className="space-y-4" id="contract-list">
            {contracts.map((contract) =>
                editingChainId === contract.id ? (
                    <ContractForm
                        key={contract.id}
                        contract={contract}
                        onSave={handleSave}
                        onCancel={() => setEditingChainId(null)}
                    />
                ) : (
                    <div
                        key={contract.id}
                        onClick={() => selectContract(contract.id)}
                        className={cn(
                            'p-4 rounded-lg cursor-pointer transition-all border-2 flex justify-between items-center',
                            selectedContractId === contract.id
                                ? 'bg-blue-100 border-blue-500 shadow-md'
                                : 'bg-white border-slate-200 hover:border-slate-400'
                        )}
                    >
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800">{CHAINS[contract.chainId]}</p>
                            <p className="text-sm text-slate-500 font-mono truncate">{contract.address}</p>
                        </div>
                        <div className="space-x-2 flex-shrink-0">
                            <Button
                                variant="orange"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingChainId(contract.id)
                                }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="red"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(contract.id, contract.address)
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )
            )}
            {isAdding ? (
                <ContractForm onSave={handleSave} onCancel={() => setIsAdding(false)} />
            ) : (
                <Button variant="green" onClick={() => setIsAdding(true)} className="w-full">
                    Add New Contract
                </Button>
            )}
        </div>
    )
}

export const ContractSettingsModal = () => {
    const { isModalOpen, closeModal, getSelectedContract } = useContractStorage()
    if (!isModalOpen) return null
    const canClose = !!getSelectedContract()
    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-50 w-full max-w-2xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Manage Contracts</h2>
                    <Button
                        variant="gray"
                        id="contract-settings-close"
                        onClick={closeModal}
                        disabled={!canClose}
                        title={canClose ? 'Close' : 'You must select a chain'}
                    >
                        Close
                    </Button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    <ContractList />
                </div>
                {!canClose && (
                    <div className="p-4 bg-yellow-100 border-t border-yellow-300 text-center text-yellow-800 font-semibold">
                        Please add and select a contract
                    </div>
                )}
            </div>
        </div>
    )
}

export const Settings = () => {
    const { openModal } = useContractStorage()
    return (
        <button onClick={openModal} className="p-2 rounded-full hover:bg-slate-200 transition-colors" title="Settings">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
        </button>
    )
}
