// Escapa caracteres especiales para poder usar texto del usuario en una regex de Mongo.
export function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
