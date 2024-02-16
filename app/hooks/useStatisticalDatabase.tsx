export const useStatisticalDatabase = async () => {
  const response = await fetch("https://andmed.stat.ee/api/v1/et/stat");

  const responseJson = await response.json();

  return responseJson;
};



