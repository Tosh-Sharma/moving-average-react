// This file is to make external REST Calls.
import { fetchRequest, buildOptions, checkResponse } from './serviceHelpers';

const currencyData = 'https://restsimulator.intuhire.com/currency_pairs';

// Should return list of currencies from the API.
export const getCurrencyData = () =>
  fetchRequest(`${currencyData}`, () => buildOptions('GET', undefined, true))
    .then(checkResponse('Currency List'))
    .then(currencyData => currencyData);

// Should return the currencies in the required format for the Select Field.
export const getCurrencySelectionData = () => {
  let selectionData = [];
  return getCurrencyData().then((currencyData) => {
    currencyData.forEach(data=> {
      selectionData.push({
        'value': data.currency_name,
        'label': data.currency_name
      });
    });
    return selectionData;
  });
}