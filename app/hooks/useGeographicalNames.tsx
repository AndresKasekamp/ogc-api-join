const useNames = async (unit: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_INSPIRE_URL}?version=2.0.0&srsname=EPSG:3301&typeNames=AU_haldusyksused:AU.AdministrativeUnit_${unit}&outputFormat=application/json&pagingEnabled=true&preferCoordinatesForWfsT11=false&restrictToRequestBBOX=1&request=GetFeature&service=wfs&propertyName=name_geographicalname_spelling_spellingofname_text`
  );

  const responseJson = await response.json();

  const names = [];
  for (let i = 0; i < responseJson.features.length; i++) {
    names.push(
      responseJson.features[i].properties
        .name_geographicalname_spelling_spellingofname_text.toLowerCase()
    );
  }

  return names;
};

export const useRegionNames = async () => {
  const countyNames = await useNames("maakond");
  const ovNames = await useNames("ov");

  return [countyNames, ovNames];
};
