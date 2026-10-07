// NYSC state-code prefixes (as on state codes like LA/26C/1234) and names.
export const STATES: [string, string][] = [
  ['AB', 'Abia'], ['AD', 'Adamawa'], ['AK', 'Akwa Ibom'], ['AN', 'Anambra'], ['BA', 'Bauchi'], ['BY', 'Bayelsa'], ['BN', 'Benue'], ['BO', 'Borno'],
  ['CR', 'Cross River'], ['DT', 'Delta'], ['EB', 'Ebonyi'], ['ED', 'Edo'], ['EK', 'Ekiti'], ['EN', 'Enugu'], ['FC', 'FCT Abuja'], ['GM', 'Gombe'],
  ['IM', 'Imo'], ['JG', 'Jigawa'], ['KD', 'Kaduna'], ['KN', 'Kano'], ['KT', 'Katsina'], ['KB', 'Kebbi'], ['KG', 'Kogi'], ['KW', 'Kwara'],
  ['LA', 'Lagos'], ['NS', 'Nasarawa'], ['NG', 'Niger'], ['OG', 'Ogun'], ['OD', 'Ondo'], ['OS', 'Osun'], ['OY', 'Oyo'], ['PL', 'Plateau'],
  ['RV', 'Rivers'], ['SO', 'Sokoto'], ['TR', 'Taraba'], ['YB', 'Yobe'], ['ZM', 'Zamfara'],
];
export const stateName = (c?: string) => (STATES.find(s => s[0] === c) || [, ''])[1] as string;
