import { v4 as uuidv4 } from "uuid"
import { customAlphabet } from "nanoid"

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
const nanoid = customAlphabet(alphabet, 8)

export function generateURL() {
  return nanoid() + ".meniu.shop"
}

export function generateId() {
  return uuidv4()
}
