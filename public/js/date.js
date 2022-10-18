const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

const getDayLong = (currentDay) => {
  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i < days.length; i++) {
        let today = days[i];
        if (currentDay === i) {
          resolve(today)
        } else if (i === days.length) {
          throw `Day Not Found...`
        }
      }
    } catch (error) {
      reject(error) 
    }
  })
}

const getDateString = () => {
  return new Promise((resolve, reject) => {
    const today = new Date()
    const year = today.getFullYear();
    const month = today.getMonth()+1;
    const day = today.getDay()
    const date = today.getDate()
    getDayLong(day).then((response) => {
     resolve(response+" "+month+'-'+date+'-'+year)
    }).catch((error) => {
      reject(error)
    })
  })
}

const getTimeString = () => {
  return new Promise((resolve, reject) => {
    const now = new Date()
    try {
      if (now.getMinutes().toString().length === 1) {
        var mins = '0'+now.getMinutes()
      } else {
        var mins = now.getMinutes()
      }
      if (now.getHours() > 12) {
        let hours = now.getHours()-12
        resolve(hours+':'+mins+'PM')
      } else if (now.getHours() === 12) {
        let hours = now.getHours()
        resolve(hours+":"+mins+"PM")
      } else if (now.getHours() < 12 && now.getHours() != 00) {
        let hours = now.getHours()
        resolve(hours+':'+mins+'AM')
      } else if (now.getHours() === 00) {
        let hours = now.getHours()+12
        resolve(hours+":"+mins+"AM")
      } else {
        throw `Error: ${now.getHours()} does not match anything...`
      }
    } catch (error) {
      reject(error)
    }
  })
}

const figureTheFuckingTime = async (callback) => {
    let dateString = await getDateString()
    let timeString = await getTimeString()
    callback(dateString+' '+timeString)
}