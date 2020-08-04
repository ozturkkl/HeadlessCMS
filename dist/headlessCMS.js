class HeadlessCMS {
    constructor(elementSelector, data = []) {
        this.elementSelector = elementSelector
        this.element = document.querySelector(elementSelector)
        this.data = []

        this.popup = null
        this.popupIndex = null
        this.overlay = null

        this.initializeModule(data)
    }

    importData(data = []) {
        this.data = [...this.data, ...data]

        this.createContainer(this.data, this.element)
    }
    exportData() {
        return this.data
    }

    initializeModule(data = []) {
        if (this.element == null) {
            console.error(`The element for the selector ${this.elementSelector} could not be found!`)
            return
        }

        this.createPopup()
        this.importData(data)
    }
    createContainer(data, container) {
        const addButton = this.createAddButton("container")

        container.textContent = "";
        container.classList.add("headlessCMS-container")
        container.appendChild(addButton)

        data.forEach(section => {
            const newSection = this.createSection()
            section.forEach(element => {
                newSection.appendChild(this.createElements(element))
            })
            container.appendChild(newSection)
        });
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
        const addButton = this.createAddButton("section")
        const node = document.createElement("div")

        node.classList.add("headlessCMS-section")
        node.appendChild(deleteButton)
        node.appendChild(addButton)

        return node
    }

    createDeleteButton() {
        const button = document.createElement("button")
        button.innerHTML = "&times;"
        button.classList.add("headlessCMS-Btn")
        button.classList.add("headlessCMS-deleteBtn")
        this.createDeleteButtonListener(button)
        return button
    }
    createDeleteButtonListener(button) {
        button.addEventListener("click", () => {
            const node = button.parentNode
            const nodeIndex = this.getElementIndex(node, 1)
            node.classList.add("headlessCMS-slideLeft")
            node.addEventListener("transitionend", () => {
                this.data.splice(nodeIndex, 1)
                this.importData()
            }, { once: true })

        })
    }

    createAddButton(container) {
        const button = document.createElement("button")
        button.innerHTML = "<span>&times;</span>"
        button.classList.add("headlessCMS-Btn")
        button.classList.add("headlessCMS-addBtn")
        this.createAddButtonListener(button, container)
        return button
    }
    createAddButtonListener(button, container) {
        button.addEventListener("click", () => {
            if (container === "container") {
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
            }
            else if (container === "section") {
                const overlay = this.overlay
                overlay.classList.add("active")
                const popup = this.popup
                popup.classList.add("active")
                this.popupIndex = this.getElementIndex(button.parentNode, 1)

                Array.from(popup.getElementsByTagName("input")).forEach(input => {
                    input.value = ""
                })
            }
        })
    }

    getElementIndex(element, offset = 0) {
        let i = 0
        while (element.previousSibling) {
            element = element.previousSibling
            i++
        }
        return i - offset
    }

    createPopup() {
        const popup = document.createElement("div")
        this.popup = popup
        popup.classList.add("headlessCMS-popup")

        const popupHeaderCloseButton = document.createElement("button")
        popupHeaderCloseButton.innerHTML = "&times;"
        popupHeaderCloseButton.classList.add("headlessCMS-popup-header-close-button")

        const popupHeader = document.createElement("div")
        popupHeader.classList.add("headlessCMS-popup-header")
        popupHeader.innerText = "Add Component"
        popupHeader.appendChild(popupHeaderCloseButton)

        const popupBody = document.createElement("div")
        popupBody.classList.add("headlessCMS-popup-body")

        popup.appendChild(popupHeader)
        popup.appendChild(popupBody)

        const overlay = document.createElement("div")
        this.overlay = overlay
        overlay.classList.add("headlessCMS-popup-overlay")

        const body = document.querySelectorAll("body")
        body.forEach(element => {
            element.appendChild(popup)
            element.appendChild(overlay)
        })

        const closePopup = () => {
            popup.classList.remove("active")
            overlay.classList.remove("active")
        }
        popupHeaderCloseButton.addEventListener("click", closePopup)
        overlay.addEventListener("click", closePopup)

        this.addPopupBodyElements(popupBody, popup, overlay)
    }
    addPopupBodyElements(popupBody, popup, overlay) {
        const object = this
        let content = null

        function createLabel(content, elementID = "") {
            const label = document.createElement("label")
            label.innerText = content
            label.setAttribute("for", elementID)
            return label
        }
        function createSelect(content) {
            const selectDiv = document.createElement("div")
            const selectLabel = createLabel("Choose the type of the component: ", "headlessCMS-popup-body-select")
            const select = document.createElement("select")
            select.classList.add("headlessCMS-popup-body-select")
            select.setAttribute("id", "headlessCMS-popup-body-select")
            select.addEventListener("change", () => {
                selectChanged(select.value)
            })
            content.forEach(item => {
                const option = document.createElement("option")
                option.value = item
                option.textContent = item
                select.appendChild(option)
            })
            selectDiv.appendChild(selectLabel)
            selectDiv.appendChild(select)

            return selectDiv
        }
        function createInputField(title) {
            const inputDiv = document.createElement("div")
            const inputLabel = createLabel(title, "headlessCMS-popup-body-input")
            const input = document.createElement("input")
            content = input
            input.classList.add("headlessCMS-popup-body-input")
            input.setAttribute("id", "headlessCMS-popup-body-input")
            inputDiv.appendChild(inputLabel)
            inputDiv.appendChild(input)

            return inputDiv
        }
        function createTextField(title) {
            const textDiv = document.createElement("div")
            const textLabel = createLabel(title, "headlessCMS-popup-body-text")
            const text = document.createElement("textarea")
            content = text
            text.classList.add("headlessCMS-popup-body-text")
            text.setAttribute("id", "headlessCMS-popup-body-text")
            textDiv.appendChild(textLabel)
            textDiv.appendChild(text)

            return textDiv
        }
        function clearPopupBody() {
            let lastChild = popupBody.lastChild
            while (lastChild.previousSibling) {
                lastChild = lastChild.previousSibling
                lastChild.nextSibling.remove()
            }
        }
        function selectChanged(value = "Main Header") {
            switch (value) {
                case "Main Header":
                default:
                    clearPopupBody()
                    popupBody.appendChild(createInputField("Main Header Content: "))
                    popupBody.appendChild(createSaveButton(value))
                    break
                case "Secondary Header":
                    clearPopupBody()
                    popupBody.appendChild(createInputField("Secondary Header Content: "))
                    popupBody.appendChild(createSaveButton(value))
                    break
                case "Paragraph":
                    clearPopupBody()
                    popupBody.appendChild(createTextField("Paragraph Content: "))
                    popupBody.appendChild(createSaveButton(value))
                    break
            }
        }
        function createSaveButton(selectValue) {
            const buttonDiv = document.createElement("div")
            const button = document.createElement("button")
            button.textContent = "Add"
            button.classList.add("headlessCMS-popup-body-save-button")
            buttonDiv.appendChild(button)
            createSaveButtonListener(button, selectValue)

            return buttonDiv
        }
        function createSaveButtonListener(button, selectValue) {
            content.addEventListener("keyup", (e) => {
                if (e.keyCode === 13) {
                    button.click()
                }
            })
            button.addEventListener("click", () => {
                if (content === null || content.value === "") {
                    content.setAttribute("placeholder", " Please enter something here...")
                    content.classList.add("headlessCMS-popup-body-error")
                    setTimeout(() => {
                        content.classList.remove("headlessCMS-popup-body-error")
                    }, 1000)
                    return
                }

                switch (selectValue) {
                    case "Main Header":
                        object.data[object.popupIndex].push(
                            {
                                type: "h2",
                                value: content.value
                            }
                        )
                        break
                    case "Secondary Header":
                        object.data[object.popupIndex].push(
                            {
                                type: "h3",
                                value: content.value
                            }
                        )
                        break
                    case "Paragraph":
                        object.data[object.popupIndex].push(
                            {
                                type: "p",
                                value: content.value
                            }
                        )
                        break
                }

                object.importData()
                popup.classList.remove("active")
                overlay.classList.remove("active")
            })
        }

        popupBody.appendChild(createSelect(["Main Header", "Secondary Header", "Paragraph", "Bullet List"]))
        selectChanged()
    }


}