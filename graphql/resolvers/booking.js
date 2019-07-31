const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformEvent } = require('./merge');

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async ({ eventId }, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const fetchedEvent = await Event.findOne({ _id: eventId });
      const booking = new Booking({
        user: req.userId,
        event: fetchedEvent,
      });
      const result = await booking.save();
      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async ({ bookingId }, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      //first get the event for which the booking is to be deleted
      const booking = await Booking.findById(bookingId).populate('event');
      const event = transformEvent(booking.event);

      //delete the booking
      await Booking.deleteOne({ _id: bookingId });

      //return the event from which the booking was deleted
      return event;
    } catch (err) {
      throw err;
    }
  }
}
