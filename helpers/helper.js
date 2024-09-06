export const generateTicketNumber = () => {
  const twoDigitNumber = Math.floor(Math.random() * (100 - 38) + 38);

  const alphabets = ["A", "B", "C", "D", "E", "G", "H", "J", "K", "L"];
  
  const randomAlphabet =
    alphabets[Math.floor(Math.random() * alphabets.length)];

  const fiveDigitNumber = String(Math.floor(Math.random() * 100000)).padStart(
    5,
    "0"
  );

  return `${twoDigitNumber + " "}${randomAlphabet + "  "}${fiveDigitNumber}`;
};
