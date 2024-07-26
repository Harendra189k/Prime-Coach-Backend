const filterByDateRange  =  function ( startDate, endDate) {
    if (startDate && endDate) {
    //   const enddate = moment(endDate).endOf('day')
      createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
      return createdAt
    } else if (startDate && !endDate) {
      createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(Date.now())
      }
      return createdAt
    } else if (!startDate && endDate) {
    //   const enddate = moment(endDate).endOf('day')
      createdAt = {
        $lte: new Date(endDate)
      }
      return createdAt
    }
  }

  module.exports = filterByDateRange;

