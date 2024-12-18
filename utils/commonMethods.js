export const getISTTime = () => {
    const currentTime = new Date();
    const istOffset = 5 * 60 + 30; // IST is UTC + 5:30
    const localTime = new Date(currentTime.getTime() + istOffset * 60 * 1000);
    console.log("currentTime",currentTime)
  
    return localTime;
  };