const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EquipmentSchemma = new Schema({
    category: {
        type: String, 
        required: true
    },
    status: {
        type: String,
        required: true,
        lowercase: true,
    },
    equipmentId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    monitorId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    equipmentRef: {
        type: String, 
        required: true,
        lowercase: true 
    },
    monitorRef: {
        type: String, 
        required: true,
        lowercase: true  
    },
    ram: {
        type: String, 
        required: true,
        lowercase: true   
    },
    diskRef:  {
        type: String, 
        required: true,
        lowercase: true   
    },
    diskSpace: {
        type: String, 
        required: true,
        lowercase: true
    },
    processor: {
        type: String, 
        required: true,
        lowercase: true
    }, 
    mouse: {
        type: String, 
        required: true,
        lowercase: true 
    },
    keyboard: {
        type: String, 
        required: true,
        lowercase: true 
    },
    OS: {
        type: String, 
        required: true,
        lowercase: true 
    },
    LicenseOS: {
        type: String, 
        required: true,
        lowercase: true 
    },
    officeVersion: {
        type: String, 
        required: true,
        lowercase: true
    },
    officeLicense: {
        type: String, 
        required: true,
        lowercase: true
    },
    observations: {
        type: String, 
        required: true,
        lowercase: true
    },
    diagnostic: {
        type: String, 
        required: true,
        lowercase: true 
    },
    recommendations: {
        type: String, 
        required: true,
        lowercase: true 
    }
});

const Equipment = mongoose.model('Equipment', EquipmentSchema);
module.exports = Equipment;