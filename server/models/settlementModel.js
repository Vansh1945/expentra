import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        fromUser: {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
        },
        toUser: {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Settlement = mongoose.model('Settlement', settlementSchema);
export default Settlement;
