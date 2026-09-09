// Genera un id simple combinando un prefijo con la fecha/hora actual.
function generateId(prefix) {
  return prefix + '-' + Date.now();
}

module.exports = { generateId };
