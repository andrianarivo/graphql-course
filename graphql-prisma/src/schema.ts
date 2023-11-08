import { builder } from "./builder"

import "./models/User"
import "./controllers/UsersController"
import "./models/Post"
import "./models/Comment"

export const schema = builder.toSchema({})