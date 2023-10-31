const message = "Some message from myModule.js"
const name = "David"
const location = "Madagascar"

const getGreeting = (name: string) => {
  return `Welcome to the course ${name}`
}

export { message, name, getGreeting, location as default }