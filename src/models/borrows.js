//fecha prestamo, hora prestamo, usuario que presto, equipo que se presto
//hora salida, estado devolucion

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const borrowingSchema = new Schema({
    borrowingDate: {
        type: Date,
        default: Date.now
    },
    startTime: {
        timestamps: true
    },
    endTime: {
        timestamps: true
    },
    devolutionState:{
        type: String,
        required: true
    },
    user: {
        type: Array
    },
    equipment: {
        type: Array
    }
});

const BorrowEquipment = mongoose.model('BorrowEquipment', borrowingSchema);
module.exports = BorrowEquipment;
