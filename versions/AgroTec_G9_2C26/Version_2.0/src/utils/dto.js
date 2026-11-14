// Convierte un documento crudo de Mongo en el objeto que espera la API: _id pasa a ser `id` en texto.
export function mapId(item) {
  const { _id, ...rest } = item;
  return { id: _id.toString(), ...rest };
}
