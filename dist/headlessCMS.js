class HeadlessCMS {
    constructor(elementSelector, data = []) {
        this.elementSelector = elementSelector
        this.element = document.querySelector(elementSelector)
        this.data = []

        this.initializeModule(data)
    }

    importData(data = []) {
        this.data = [...this.data, ...data]

        this.element.textContent = "";
        this.element.appendChild(this.createAddButton())

        this.data.forEach(section => {
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



    initializeModule(data = []) {
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
    createSection() {
        const deleteButton = this.createDeleteButton()

        const node = document.createElement("div")
        node.appendChild(deleteButton)
        node.classList.add("headlessCMS-section")

        return node
    }

    createDeleteButton() {
        const button = document.createElement("button")
        button.classList.add("headlessCMS-Btn")
        button.classList.add("headlessCMS-deleteBtn")
        this.createDeleteButtonListener(button)
        return button
    }
    createDeleteButtonListener(button) {
        button.addEventListener("click", () => {
            const node = button.parentNode
            const nodeIndex = this.getElementIndex(node)
            node.classList.add("headlessCMS-slideLeft")
            node.addEventListener("transitionend", () => {
                this.data.splice(nodeIndex, 1)
                this.importData()
            }, { once: true })

        })
    }

    createAddButton() {
        const button = document.createElement("button")
        button.classList.add("headlessCMS-Btn")
        button.classList.add("headlessCMS-addBtn")
        this.createAddButtonListener(button)
        return button
    }
    createAddButtonListener(button) {
        button.addEventListener("click", () => {
            const node = button.parentNode
            const section = this.createSection()

            section.classList.add("headlessCMS-transition")
            section.classList.add("headlessCMS-slideLeft")
            node.prepend(section)
            setTimeout(() => {
                section.classList.remove("headlessCMS-slideLeft")
            }, 0)

            node.addEventListener("transitionend", () => {
                this.data.unshift([])
                this.importData()
            }, { once: true })
        })
    }

    getElementIndex(element) {
        let i = 0
        while (element.previousSibling) {
            element = element.previousSibling
            i++
        }
        return i
    }


}