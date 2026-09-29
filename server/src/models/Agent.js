import mongoose from 'mongoose';
const agentSchema = new mongoose.Schema({ agentId: { type: String, required: true, unique: true }, name: { type: String, required: true }, status: { type: String, enum: ['idle', 'running', 'failed'], default: 'idle' }, lastExecution: Date, logs: [{ type: String }], capabilities: [{ type: String }] }, { timestamps: true });
export const Agent = mongoose.model('Agent', agentSchema);
