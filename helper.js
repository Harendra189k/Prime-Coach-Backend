const moment = require("moment");

// const filterByDateRange = function (startDate, endDate) {
//   let createdAt = {}
//   if (startDate && endDate) {
//       const enddate = moment(endDate).endOf('day')
//    createdAt = {
//       $gte: new Date(startDate),
//       $lte: new Date(endDate),
//     };
//   } else if (startDate && !endDate) {
//     createdAt = {
//       $gte: new Date(startDate),
//       $lte: new Date(Date.now()),
//     };
//   } else if (!startDate && endDate) {
//       const enddate = moment(endDate).endOf('day')
//     createdAt = {
//       $lte: new Date(endDate),
//     };
//   }
//   return createdAt;
// };

const filterByDateRange = function (startDate, endDate) {
  let createdAt = {};
  
  if (startDate && endDate) {
    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();
    
    createdAt = {
      $gte: start,
      $lte: end,
    };
  } else if (startDate && !endDate) {
    const start = moment(startDate).startOf('day').toDate();
    const end = new Date(); 
    
    createdAt = {
      $gte: start,
      $lte: end,
    };
  } else if (!startDate && endDate) {
    const end = moment(endDate).endOf('day').toDate();
    
    createdAt = {
      $lte: end,
    };
  }
  
  return createdAt;
};


module.exports = filterByDateRange;
