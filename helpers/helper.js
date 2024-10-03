const groups = Array.from({ length: 62 }, (_, i) => (38 + i).toString());
const series = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'L'];
const maxNumber = 99999;

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTicket(group, seriesIndex, number) {
  return `${group} ${series[seriesIndex]} ${String(number).padStart(5, '0')}`;
}

export const generateTickets = (sem) => {
  const tickets = [];
  let groupIndex = getRandomNumber(0, groups.length - 1);
  let number = getRandomNumber(0, maxNumber);

  for (let i = 0; i < sem; i++) {
    let seriesIndex;

    if (sem === 5) {
      seriesIndex = i % 5;
    } else if (sem === 10) {
      seriesIndex = i % 10;
      if (i > 0 && i % 10 === 0) groupIndex++;
    } else if (sem === 25) {
      seriesIndex = i % 5;
      if (i > 0 && i % 5 === 0) groupIndex++;
    } else if (sem === 50 || sem === 100 || sem === 200) {
      seriesIndex = i % 10;
      if (i > 0 && i % 10 === 0) groupIndex++;
    }

    // Ensure groupIndex stays within bounds of the groups array
    if (groupIndex >= groups.length) {
      groupIndex = 0;
    }

    tickets.push(generateTicket(groups[groupIndex], seriesIndex, number));
  }

  return tickets;
};
