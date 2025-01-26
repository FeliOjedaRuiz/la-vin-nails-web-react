const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			maxLength: [20, 'Maximo 20 caracteres.'],
		},
		category: {
			type: String,
			enum: ['Insumos', 'Gastos fijos', 'Otros'],
			default: 'Otros',
		},
		amount: {
			type: Number,
			required: true,
			min: [0, 'El monto no puede ser negativo.'],
			max: [2000, 'El monto no puede superar los 2000.'],
		},
		date: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform: function (doc, ret) {
				delete ret.__v;
				ret.id = ret._id;
				delete ret._id;
				return ret;
			},
		},
	}
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
