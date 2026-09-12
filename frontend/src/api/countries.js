import countryList from "react-select-country-list";

export const getCountries = async () => {
  return countryList()
    .getData()
    .map((country) => ({
      code: country.value,
      name: country.label,
    }));
};
