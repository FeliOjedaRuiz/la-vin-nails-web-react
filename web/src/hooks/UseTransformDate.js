function useTransformDate(date) {
  let dt = new Date(date);
  let year = dt.getFullYear();
  let month = dt.getMonth() + 1;
  let day = dt.getDate();

  if (month < 10) {
    month = '0' + month;
  }

  if (day < 10) {
    day = '0' + day;
  }

  return `${year}-${month}-${day}`;
};

export default useTransformDate