// Example dbService for abstracting DB logic
export const findAll = async (Model, query = {}) => Model.find(query);
export const findById = async (Model, id) => Model.findById(id);
export const createDoc = async (Model, data) => Model.create(data);
export const updateDoc = async (Model, id, data) => Model.findByIdAndUpdate(id, data, { new: true });
export const deleteDoc = async (Model, id) => Model.findByIdAndDelete(id); 