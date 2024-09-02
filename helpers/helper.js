export const generateTicketNumber = () => {
  // Generate 2-digit number between 38 and 99
  const twoDigitNumber = Math.floor(Math.random() * (100 - 38) + 38);

  // Define the set of alphabets
  const alphabets = ["A", "B", "C", "D", "E", "G", "H", "J", "K", "L"];
  // Randomly select an alphabet
  const randomAlphabet =
    alphabets[Math.floor(Math.random() * alphabets.length)];

  // Generate 5-digit number between 00000 and 99999
  const fiveDigitNumber = String(Math.floor(Math.random() * 100000)).padStart(
    5,
    "0"
  );

  // Combine to form the ticket number
  return `${twoDigitNumber + " "}${randomAlphabet + "  "}${fiveDigitNumber}`;
};
