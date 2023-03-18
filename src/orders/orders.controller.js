// Add middleware and handlers for orders to this file, then export the functions for use by the router.

const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// Rest mapping 

function list(req, res) {
    const { orderId } = req.params;
    res.json({ data: orders.filter(orderId ? order => order.id == orderId : () => true) }); 
}

function read(req, res, next) {
    res.json({ data: res.locals.order });
};

function create(req, res) {
	const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
	const newOrder = {
		id: nextId(),
		deliverTo: deliverTo,
		mobileNumber: mobileNumber,
		status: status ? status : "pending",
		dishes: dishes,
	}
	orders.push(newOrder);
	res.status(201).json({ data: newOrder });
}

function update(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body; 
    res.locals.order = {
		id: res.locals.order.id,
		deliverTo: deliverTo,
		mobileNumber: mobileNumber,
		dishes: dishes,
		status: status, 
    }
    res.json({ data: res.locals.order });  
}

function destroy(req, res) {
    const index = orders.indexOf(res.locals.order);
    orders.splice(index, 1);
    res.sendStatus(204);
}

// Middleware functions

function orderExists(req, res, next) {
	const { orderId } = req.params;
	const foundOrder = orders.find((order) => order.id === orderId);
	if(foundOrder) {
		res.locals.order = foundOrder;
		return next();
	}
	next({
		status: 404,
		message: `Order id does not exist: ${orderId}`,
	});
}

function updateStatusPropertyIsValid(req, res, next) {
	const { orderId } = req.params;
	const { data: { id, status } = {} } = req.body;
	let errorMessage;
	if(id && id !== orderId) {
        errorMessage = `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    }
	else if(!status || status === "" || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery")) {
        errorMessage = "Order must have a status of pending, preparing, out-for-delivery, delivered";
    }
	else if(status === "delivered") {
       errorMessage = "A delivered order cannot be changed" 
    }
	if(errorMessage) {
		return next({
			status: 400,
			message: errorMessage,
		});
	}
	next();
}

function orderPropertiesAreValid(req, res, next) {
	const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
	let errorMessage;
	if(!deliverTo || deliverTo === "") {
        errorMessage = "Order must include a deliverTo";
    }
	else if(!mobileNumber || mobileNumber === "") {
        errorMessage = "Order must include a mobileNumber";
    }
	else if(!dishes) {
        errorMessage = "Order must include a dish";
    }
	else if(!Array.isArray(dishes) || dishes.length === 0) {
        errorMessage = "Order must include at least one dish";
    }
	else {
		for(let index = 0; index < dishes.length; index++) {
			if(!dishes[index].quantity || dishes[index].quantity <= 0 || !Number.isInteger(dishes[index].quantity))
				errorMessage = `Dish ${index} must have a quantity that is an integer greater than 0`;
		}
	}
	if(errorMessage) {
		return next({
			status: 400,
			message: errorMessage,
		});
	}
	next();
}

function deleteStatusPropertyIsValid(req, res, next) {
	if(res.locals.order.status !== "pending") {
		return next({
			status: 400,
			message: "An order cannot be deleted unless it is pending",
		});
	}
	next();
}

module.exports = {
    create: [
        orderPropertiesAreValid,
        create
    ],
    list,
    read: [
        orderExists,
        read
    ],
    update: [
        orderPropertiesAreValid,
        orderExists,
        updateStatusPropertyIsValid,
        update
    ],
    delete: [
        orderExists,
        deleteStatusPropertyIsValid,
        destroy
    ]

}