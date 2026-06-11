/**
 * @typedef {'Entrada'|'Sopa'|'Segundo'|'Bebida'|'Postre'} DishType
 * @typedef {'En reserva'|'En preparación'|'Entregado'|'Atrasado'|'Cancelado'} OrderStatus
 * @typedef {'Admin'|'Camarero'|'Cliente'} AppRole
 *
 * @typedef {Object} Dish
 * @property {string} id
 * @property {string} name
 * @property {DishType} type
 * @property {number} total_orders_history
 * @property {string} image
 *
 * @typedef {Object} MenuEntry
 * @property {string} id
 * @property {string} dishId
 * @property {number} price
 * @property {number} stock
 * @property {number} soldToday
 * @property {string} name
 * @property {string} image
 * @property {DishType} type
 *
 * @typedef {Object} ComboSlot
 * @property {string} id
 * @property {string} label
 * @property {string[]} allowedDishIds
 *
 * @typedef {Object} Combo
 * @property {string} id
 * @property {string} name
 * @property {number} basePrice
 * @property {string} image
 * @property {ComboSlot[]} slots
 *
 * @typedef {Object} OrderLine
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} type
 *
 * @typedef {Object} Order
 * @property {string} id
 * @property {string|null} clientId
 * @property {string} createdBy
 * @property {OrderLine[]} detalle_platos
 * @property {number} total
 * @property {OrderStatus} status
 * @property {boolean} isPaid
 * @property {boolean} isTakeaway
 * @property {string} location
 * @property {number} createdAt
 *
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} address
 * @property {string} photo
 * @property {number} total_orders_history
 * @property {string} [email]
 *
 * @typedef {Object} Staff
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} photo
 * @property {AppRole} role
 *
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} author
 * @property {string} date
 * @property {number} rating
 * @property {string} text
 * @property {string[]} tags
 *
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [photo]
 * @property {AppRole} role
 */

export {};
