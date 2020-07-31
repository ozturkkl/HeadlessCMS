class HeadlessCMS {
    constructor(elementSelector, data = []) {
        this.elementSelector = elementSelector
        this.element = document.querySelector(elementSelector)
        this.data = []

        this.initializeModule(data)
    }

    importData(data) {
        this.data = [...this.data, ...data]
        data.forEach(section => {
            const newSection = this.createSection()
            section.forEach(element => {
                newSection.appendChild(this.createElements(element))
            })
            this.element.appendChild(newSection)
        });
    }
    exportData() {
        return this.data
    }





    initializeModule(data) {
        if (this.element == null) {
            console.error(`The element for the selector ${this.elementSelector} could not be found!`)
            return
        }
        this.element.classList.add("headlessCMS-container")
        this.importData(data)
    }
    createElements(element) {
        const node = document.createElement(element.type)
        node.textContent = element.value

        if (element.type === "ul" || element.type === "ol") {
            node.textContent = ""
            element.value.forEach(value => {
                const li = document.createElement("li")
                li.textContent = value
                node.appendChild(li)
            })
        }

        return node
    }
    createSection(){
        const node = document.createElement("div")
        node.classList.add("headlessCMS-section")
        return node
    }
}