class HeadlessCMS {
    constructor(elementSelector, data = []) {
        this.elementSelector = elementSelector
        this.element = document.querySelector(elementSelector)
        this.data = data

        this.initializeModule(data)
    }

    initializeModule(data) {
        if (this.element == null) {
            console.error(`The element for the selector ${this.elementSelector} could not be found!`)
            return
        }
        this.element.classList.add("headlessCMS-container")
        this.importData(data)
    }

    importData(data) {
        data.forEach(element => {
            this.element.appendChild(this.createElement(element))
        });
    }
    createElement(element) {
        const node = document.createElement("h2")
        node.textContent = element.value
        return node
    }
}