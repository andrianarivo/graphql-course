import myCurrentLocation, { getGreeting, message, name } from './myModule'
import myAddFunction, { subtract } from './math'

console.log(message, name, myCurrentLocation)
console.log(getGreeting('David'))

console.log("Add:", myAddFunction(1, 2))
console.log("Subtract:", subtract(1, 2))
