import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    minlength: [2, 'Store name must be at least 2 characters']
  },
  proprietor: {
    type: String,
    required: [true, 'Proprietor name is required'],
    trim: true,
    minlength: [2, 'Proprietor name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\d\s\-()+]{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [5, 'Address must be at least 5 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: true // Never return password in queries
  },
  role : {
    type : String,
    enum : ['user','admin'],
    default : 'user',
    required : true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

export default mongoose.model('User', userSchema);