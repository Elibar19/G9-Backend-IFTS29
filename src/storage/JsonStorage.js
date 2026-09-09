const fs = require('fs');
const path = require('path');

// Clase simple para leer y escribir un archivo JSON como si fuera una tabla.
class JsonStorage {
  constructor(fileName) {
    this.filePath = path.join(__dirname, '../../data', fileName);
    this.ensureFile();
  }

  // Si el archivo no existe todavía, lo crea vacío ([]).
  ensureFile() {
    const folder = path.dirname(this.filePath);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]');
    }
  }

  read() {
    const content = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(content);
  }

  write(items) {
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2));
  }

  findAll() {
    return this.read();
  }

  findById(id) {
    const items = this.read();
    const item = items.find((item) => item.id === id);
    return item || null;
  }

  insert(newItem) {
    const items = this.read();
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  update(id, updatedItem) {
    const items = this.read();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    items[index] = updatedItem;
    this.write(items);
    return updatedItem;
  }

  delete(id) {
    const items = this.read();
    const newItems = items.filter((item) => item.id !== id);
    this.write(newItems);
  }
}

module.exports = JsonStorage;
