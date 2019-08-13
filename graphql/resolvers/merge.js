const DataLoader = require('dataloader');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');

//must get a list of events, a single event, ...
const eventLoader = new DataLoader((eventIds) => {
  return events(eventIds);
});

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(transformEvent);
  } catch (err) {
    throw err;
  }
}

const singleEvent = async eventId => {
  try {
    const event = await eventLoader.load(eventId);
    return event;
  } catch (err) {
    throw err;
  }
}

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      password: null,
      createdEvents: () => eventLoader.loadMany(user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
}

const transformEvent = event => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  }
}

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
