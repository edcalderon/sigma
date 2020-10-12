const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const equipmentSchema = new Schema({
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
    memoryRam: {
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
    licenseOS: {
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
    observation: {
        type: String, 
        required: true,
        lowercase: true
    },
    diagnostic: {
        type: String, 
        required: true,
        lowercase: true 
    },
    recommendation: {
        type: String, 
        required: true,
        lowercase: true 
    },
    imagen: {
        type: Buffer
    }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;