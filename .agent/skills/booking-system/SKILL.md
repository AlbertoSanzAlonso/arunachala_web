---name: booking-systemdescription: Implement yoga and therapy booking systems with availability managementlicense: MITcompatibility: opencodemetadata:  audience: developers  domain: booking-system  project: arunachala-web---
## What I do
- Create booking models for in-studio yoga classes and therapy sessions
- Implement availability management with time slots
- Handle booking confirmations and cancellations
- Set up calendar integration
- Manage class capacity limits
- Create booking status workflows
- Handle in-person session scheduling
- Send confirmation notifications

## When to use me
Use this when you need to:
- Create booking functionality
- Manage class schedules
- Handle time slot availability
- Process booking confirmations
- Set up calendar views
- Manage capacity limits
- Implement payment flows

## My patterns for Arunachala Web
### Yoga Bookings
- Class-based bookings with capacity limits
- Weekly recurring schedules
- Instructor assignment
- Studio location management
- Online/offline class types

### Therapy Bookings  
- Individual therapy sessions
- Therapist availability calendars
- Session duration management
- Room/space assignment
- Specialized therapy types

### Common Features
- Real-time availability updates
- Booking status: pending, confirmed, cancelled, completed
- Waitlist management for full classes
- Automated email/SMS confirmations
- Cancellation policies with refund logic
- Booking history for users

### Data Models
```python
# Yoga Class Booking
class YogaClass:
    title, description, instructor, capacity
    schedule_recurring, duration, price
    
class Booking:
    user, class_or_therapy, time_slot
    status, payment_status, created_at

# Therapy Booking  
class Therapy:
    name, description, duration, price
    requirements, therapist_requirements
    
class Availability:
    therapist, date, time_slots, status
```

## Technology specifics
- PostgreSQL for booking data storage
- SQLAlchemy models for relationships
- FastAPI endpoints for booking operations
- React components for booking UI
- Calendar integration (outlook/google)
- WhatsApp notifications via Meta API
- Payment processing integration

## Usage Examples

| User Task | Skills Auto-invocadas | Comandos Resultantes |
|---|---|---|
| **Create yoga booking system** | `booking-system` | `skill({ name: "booking-system" })` |
| **Manage class availability** | `booking-system` | `skill({ name: "booking-system" })` |
| **Configure therapy calendar** | `booking-system` | `skill({ name: "booking-system" })` |
| **Implement capacity management** | `booking-system` | `skill({ name: "booking-system" })` |
| **Create waitlist system** | `booking-system` | `skill({ name: "booking-system" })` |
| **Handle booking confirmations** | `booking-system` | `skill({ name: "booking-system" })` |
| **Configure cancellation policies** | `booking-system` | `skill({ name: "booking-system" })` |
| **Create booking dashboard** | `booking-system` + `react-developer` | `skill({ name: "booking-system" }) + skill({ name: "react-developer" })` |
| **Integrate external calendar** | `booking-system` | `skill({ name: "booking-system" })` |
| **Manage multiple therapy types** | `booking-system` | `skill({ name: "booking-system" })` |
| **Book in-person therapy session** | `booking-system` | `skill({ name: "booking-system" })` |