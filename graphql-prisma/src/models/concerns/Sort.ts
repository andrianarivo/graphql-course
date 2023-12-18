import {builder} from "../../builder";

export enum Sort {
  ASC = 'asc',
  DESC = 'desc'
}

builder.enumType(Sort, {
  name: 'Sort'
})