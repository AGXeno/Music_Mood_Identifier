// Mock MQTT library for testing
global.mqtt = {
    connect: jest.fn(() => ({
        on: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn(),
        end: jest.fn()
    }))
}

// Mock TensorFlow.js for testing
global.tf = {
    loadLayersModel: jest.fn(() => Promise.resolve({})),
    tensor: jest.fn()
}

// Mock fetch for API testing
global.fetch = jest.fn()