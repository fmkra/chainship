# Chainship

## Wprowadzenie

Projekt zakłada stworzenie aplikacji opartej na technologii blockchain, która umożliwi grę w statki pomiędzy dwoma graczami. Gra odbywać się będzie w pełni w przeglądarce, przy użyciu interface'u napisanego w JavaScriptcie i współpracy z portfelem Metamask. Aplikacja będzie wystawiona publicznie jako strona internetowa, jednak każdy użytkownik będzie mógł uruchomić ją lokalnie z pominięciem centralnego serwera, co zminimalizuje konieczność większego zaufania. Wszystkie działania związane z grą, takie jak utworzenie pokoju, przechowywanie danych o ustawieniu statków, strzały, wyniki gry, będą realizowane na kontraktach blockchainowych na Ethereum. Dzięki tej technologii możliwe będzie zapewnienie przejrzystości, bezpieczeństwa oraz decentralizacji całego procesu.

## Opis gry

Gra toczyć się będzie o pulę pieniężną, którą obaj gracze wpłacają przed rozpoczęciem rozgrywki. Zwycięzca otrzymuje całą pulę, z wyjątkiem opcjonalnej prowizji, którą może pobierać właściciel kontraktów.

Gra będzie odbywać się między dwoma graczami. Kluczowe elementy rozgrywki to:
- Tworzenie pokoju gry: Jeden z graczy może stworzyć prywatny pokój, zapraszając drugiego gracza za pomocą linku. (opcjonalne) Inną opcją jest połączenie z losowym graczem na podstawie punktów rankingowych.
- Faza ustawienia statków: Obaj gracze wybierają pola na planszy, na których umieszczą swoje statki. Ten etap będzie odbywać się w aplikacji w interfejsie graficznym.
- Faza strzałów: Po ustawieniu statków gracze na przemian strzelają do pól na planszy przeciwnika. Wyniki strzałów będą natychmiastowo rejestrowane na blockchainie, a aplikacja przeglądarkowa będzie dostarczać użytkownikom aktualne dane o stanie gry.
- Dowodzenie wygranej: Po zakończeniu gry, zwycięzca musi udowodnić, że poprawnie odpowiadał na pytania przeciwnika. Dopiero w tym momencie każdy z graczy zdradza jak wygląda jego plansza, co sprawia, że żaden z graczy nie może oszukiwać.
- Ranking graczy: Aplikacja będzie prowadziła ranking najlepszych graczy, bazując na liczbie wygranych gier oraz wysokości ich wygranych. Ranking będzie widoczny dla wszystkich graczy i stanowił element rywalizacji.

## Korzyści z realizacji projektu na blockchainie

Realizacja tej gry na blockchainie przynosi szereg korzyści, które wyróżniają ją na tle tradycyjnych gier internetowych. Oto kluczowe argumenty, dlaczego blockchain jest idealnym rozwiązaniem w tym przypadku:

### Decentralizacja i bezpieczeństwo

Blockchain zapewnia, że gra jest całkowicie zdecentralizowana, eliminując potrzebę istnienia centralnego serwera. Gracze nie muszą ufać żadnej pojedynczej stronie czy organizacji, ponieważ wszystkie dane związane z grą (takie jak ustawienie statków, strzały, wynik gry) są przechowywane w rozproszony sposób na blockchainie. Każdy ruch gracza jest rejestrowany i weryfikowany przez cały system, co zapewnia transparentność i bezpieczeństwo. Ponad to, brak serwera oznacza również, że nikt poza graczem nie zna ułożenia statków na jego planszy przez zakończeniem fazy strzałów, dzięki czemu współpraca z twórcą aplikacji nie mogłaby przynieść graczowi żadnej korzyści.

### Transparentność wyników

Dzięki zastosowaniu blockchaina wszystkie wyniki gier są zapisane w sposób jawny, a każda zmiana stanu gry (np. trafienie w statek) jest publicznie dostępna. Zwycięzca gry nie tylko otrzymuje pulę, ale ma również pełną możliwość udowodnienia swojej wygranej poprzez weryfikację zapisanych na blockchainie transakcji. To eliminuje ryzyko oszustwa czy manipulacji. Ponad to, system rankingowy jest w pełni jawny i deterministyczny, więc gracze mają pewność, że pozycje użytkowników w rankingu są uczciwie zdobyte.

### Prowizje i monetyzacja

Zastosowanie blockchaina umożliwia właścicielowi kontraktów pobieranie prowizji od wygranych. System ten jest bezpieczny i automatyczny, co eliminuje potrzebę jakiejkolwiek zewnętrznej kontroli nad procesem wypłat. Prowizja będzie ustalana w sposób przejrzysty, a użytkownicy mogą mieć pewność, że zasady są jasno określone i egzekwowane.

### Brak centralnej kontroli

Brak centralnego serwera oznacza, że nie ma jednego punktu awarii. Gra jest całkowicie rozproszona i działa na blockchainie, co oznacza, że nawet w przypadku problemów z infrastrukturą, gra nadal może funkcjonować, a dane pozostaną nienaruszone.
