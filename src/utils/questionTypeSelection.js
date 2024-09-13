const questionType = {
  MSA: "Multiple Choice Single Answer",
  MMA: "Multiple Choice Multiple Answers",
  TOF: "True or False",
  SAQ: "Short Answer Question",
  MTF: "Match the Following",
  ORB: "Ordering",
  FIB: "Fill in the Blanks",
};
exports.setQuestionType = (type_code) => {
  return questionType[type_code];
};
