export const classifyBloodPressure = (systolic, diastolic) => {
  if (systolic >= 180 || diastolic >= 120) {
    return "고혈압 위기";
  } else if (systolic >= 140 || diastolic >= 90) {
    return "2기 고혈압";
  } else if (systolic >= 130 || diastolic >= 80) {
    return "1기 고혈압";
  } else if (systolic >= 120 && diastolic < 80) {
    return "주의 혈압";
  } else if (systolic < 120 && diastolic < 80) {
    return "정상 혈압";
  } else {
    return "분류 불가"; // Should not happen with valid inputs
  }
};
