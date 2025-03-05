const Person = require('../models/person');

// Add a new person (actor/director/crew)
exports.addPerson = async (req, res) => {
    try {
        const person = new Person(req.body);
        await person.save();
        res.status(201).json(person);
    } catch (error) {
        res.status(500).json({ message: 'Error adding person', error });
    }
};

// Get details of an actor/director/crew member
exports.getPersonDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const person = await Person.findById(id).populate('filmography', 'title genre releaseDate');
        if (!person) return res.status(404).json({ message: 'Person not found' });
        res.json(person);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching person details', error });
    }
};
