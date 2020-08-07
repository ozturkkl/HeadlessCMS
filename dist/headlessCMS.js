class HeadlessCMS {
    constructor(elementSelector, data = []) {
        this.elementSelector = elementSelector
        this.element = document.querySelector(elementSelector)
        this.data = []
        this.dataTypes = []

        this.popup = null
        this.popupIndex = null
        this.overlay = null

        this.activeComponent = null

        this.editEnabled = false

        this.initializeModule(data)
    }


    initializeModule(data = []) {
        if (this.element == null) {
            console.error(`The element for the selector ${this.elementSelector} could not be found!`)
            return
        }

        this.setDataTypes()
        this.createPopup()
        this.importData(data)
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
        popupHeader.innerHTML = `<span>Add Component</span>`
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

        function clearPopupBody() {
            let lastChild = popupBody.lastChild
            while (lastChild.previousSibling) {
                lastChild = lastChild.previousSibling
                lastChild.nextSibling.remove()
            }
        }

        function createLabel(content, elementID = "") {
            const label = document.createElement("label")
            label.innerText = content
            label.setAttribute("for", elementID)
            return label
        }
        function createInputField(title, type) {
            const inputDiv = document.createElement("div")
            const inputLabel = createLabel(title, "headlessCMS-popup-body-input")
            const input = document.createElement((type === "p" || type === "ul") ? "textarea" : "input")
            content = input
            input.classList.add("headlessCMS-popup-body-input")
            input.setAttribute("id", "headlessCMS-popup-body-input")
            input.setAttribute("type", "text")
            inputDiv.appendChild(inputLabel)
            inputDiv.appendChild(input)

            return inputDiv
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
                option.value = item.type
                option.textContent = item.value
                select.appendChild(option)
            })
            selectDiv.appendChild(selectLabel)
            selectDiv.appendChild(select)

            return selectDiv
        }
        function selectChanged(value = "h2") {
            const type = object.dataTypes.find(element => {
                return element.type === value
            })

            clearPopupBody()
            const activeInputElement = createInputField(`${type.value} Content: `, type.type)
            popupBody.appendChild(activeInputElement)
            popupBody.appendChild(createDeleteButton(createSaveButton(value)))

            return activeInputElement
        }

        function createSaveButton(selectValue) {
            const buttonDiv = document.createElement("div")
            const button = document.createElement("button")
            button.textContent = "Add"
            button.classList.add("headlessCMS-popup-body-save-button")
            button.classList.add("headlessCMS-popup-body-button")
            buttonDiv.appendChild(button)
            createSaveButtonListener(button, selectValue)

            return buttonDiv
        }
        function createSaveButtonListener(button, selectValue) {
            content.addEventListener("keyup", (e) => {
                if (e.keyCode === 13 && content.tagName !== "TEXTAREA" || e.keyCode === 13 && e.ctrlKey) {
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

                object.saveElements(selectValue, content.value)

                popup.classList.remove("active")
                overlay.classList.remove("active")
            })
        }

        function createDeleteButton(div) {
            const buttonDiv = div
            const button = document.createElement("button")
            button.textContent = "Delete Element"
            button.classList.add("headlessCMS-popup-body-delete-button")
            button.classList.add("headlessCMS-popup-body-delete-button-hide")
            button.classList.add("headlessCMS-popup-body-button")
            buttonDiv.appendChild(button)
            createDeleteButtonListener(button)

            return buttonDiv
        }
        function createDeleteButtonListener(button) {
            button.addEventListener("click", () => {
                const elementToDeleteIndex = object.getElementIndex(object.activeComponent, 2)

                object.data[object.popupIndex].splice(elementToDeleteIndex, 1)
                object.importData()

                popup.classList.remove("active")
                overlay.classList.remove("active")
            })
        }

        popupBody.appendChild(createSelect(this.dataTypes))
        selectChanged()

        this.selectChanged = selectChanged
        this.content = content
    }
    showPopup(mode = "add", button, type = "h2") {
        this.overlay.classList.add("active")
        this.popup.classList.add("active")
        this.popupIndex = this.getElementIndex(button.parentNode, 1)
        const activeInputElement = this.selectChanged(type).lastChild

        const popupHeader = this.popup.querySelector(".headlessCMS-popup-header").querySelector("span")
        const deleteButton = this.popup.querySelector(".headlessCMS-popup-body-delete-button")
        const saveButton = this.popup.querySelector(".headlessCMS-popup-body-save-button")
        const select = this.popup.querySelector(".headlessCMS-popup-body-select")
        const selectLabel = this.popup.querySelector(`[for="headlessCMS-popup-body-select"]`)
        select.value = type


        if (mode === "edit") {
            popupHeader.innerText = `Edit Component`
            deleteButton.classList.remove("headlessCMS-popup-body-delete-button-hide")
            saveButton.innerText = `Save`
            select.disabled = true
            selectLabel.innerText = "Type of the component: "
            activeInputElement.value = this.data[this.popupIndex][this.getElementIndex(this.activeComponent, 2)].value
        }
        else if (mode === "add") {
            popupHeader.innerText = `Add Component`
            deleteButton.classList.add("headlessCMS-popup-body-delete-button-hide")
            saveButton.innerText = `Add`
            select.disabled = false
            selectLabel.innerText = `Choose the type of the component: `
        }
    }


    importData(data = []) {
        this.data = [...this.data, ...data]

        this.createContainer(this.data, this.element)

        if (this.editEnabled) {
            this.enableSectionDragging()
            this.enableComponentDragging()
        }
    }
    exportData() {
        return this.data
    }


    createContainer(data, container) {
        const addButton = this.createAddButton("container")

        container.textContent = "";
        container.classList.add("headlessCMS-container")
        if (this.editEnabled)
            container.appendChild(addButton)

        data.forEach(section => {
            const newSection = this.createSection()
            section.forEach(element => {
                const component = this.renderElements(element)
                newSection.appendChild(component)
                if (this.editEnabled)
                    this.createElementListeners(component, element)
            })
            container.appendChild(newSection)
        });
    }
    createSection() {
        const deleteButton = this.createDeleteButton()
        const addButton = this.createAddButton("section")
        const node = document.createElement("div")

        node.classList.add("headlessCMS-section")
        if (this.editEnabled) {
            node.appendChild(deleteButton)
            node.appendChild(addButton)
        }

        return node
    }
    createElementListeners(component, element) {
        component.addEventListener("mouseenter", () => {
            document.querySelectorAll(".headlessCMS-container .headlessCMS-hover").forEach(element => {
                element.classList.remove("headlessCMS-hover")
            })
            component.classList.add("headlessCMS-hover")
        })
        component.addEventListener("mouseleave", () => {
            document.querySelectorAll(".headlessCMS-container .headlessCMS-hover").forEach(element => {
                element.classList.remove("headlessCMS-hover")
            })
        })
        component.addEventListener("click", () => {
            this.activeComponent = component
            this.showPopup("edit", component, element.type)
        })
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
        button.innerHTML = (container === "container") ? "Add Section +" : "<span>&times;</span>"
        button.classList.add("headlessCMS-Btn")
        button.classList.add("headlessCMS-addBtn")
        if (container === "container") {
            button.classList.add("headlessCMS-addBtn-container")
        }
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
                this.showPopup("add", button)
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

    enableSectionDragging() {
        const draggingClass = "headlessCMS-section-dragging"
        const sections = [...this.element.children].filter(section => section.classList.contains("headlessCMS-section"))

        let dragStartIndex = null
        let dragEndIndex = null

        sections.forEach(section => {
            section.draggable = true

            section.addEventListener("dragstart", (e) => {
                e.stopPropagation()
                section.classList.add(draggingClass)
                dragStartIndex = this.getElementIndex(section, 1)
            })
            section.addEventListener("dragend", (e) => {
                e.stopPropagation()
                section.classList.remove(draggingClass)
                dragEndIndex = this.getElementIndex(section, 1)

                if (dragStartIndex !== dragEndIndex) {
                    this.data.splice(dragEndIndex, 0, this.data.splice(dragStartIndex, 1)[0])
                    this.importData()
                }
            })
        })

        const dragoverHandler = (e) => {
            e.preventDefault()
            e.stopPropagation()
            const dragging = this.element.querySelector(`.${draggingClass}`)
            if (!dragging) return

            const afterElement = this.elementAfterMouse(sections, e.clientY, draggingClass).element
            if (afterElement)
                this.element.insertBefore(dragging, afterElement)
            else
                this.element.appendChild(dragging)
        }
        this.element.removeEventListener("dragover", this.sectionDragHandler)
        this.element.addEventListener("dragover", dragoverHandler)
        this.sectionDragHandler = dragoverHandler
    }
    enableComponentDragging() {
        const draggingClass = "headlessCMS-component-dragging"
        const sections = [...this.element.children].filter(section => section.classList.contains("headlessCMS-section"))
        const components = []
        sections.forEach(section => {
            components.push(...[...section.children].filter(component => component.tagName !== "BUTTON"))
        })

        let dragStartIndex = null
        let dragEndIndex = null
        let dragStartSection = null
        let dragEndSection = null


        components.forEach(component => {
            component.draggable = true

            component.addEventListener("dragstart", (e) => {
                e.stopPropagation()
                component.classList.add(draggingClass)
                dragStartIndex = this.getElementIndex(component, 2)
                dragStartSection = this.getElementIndex(component.parentNode, 1)
            })
            component.addEventListener("dragend", (e) => {
                e.stopPropagation()
                component.classList.remove(draggingClass)
                dragEndIndex = this.getElementIndex(component, 2)
                dragEndSection = this.getElementIndex(component.parentNode, 1)

                if (dragStartIndex === dragEndIndex && dragStartSection === dragEndSection)
                    return

                const item = this.data[dragStartSection].splice(dragStartIndex, 1)[0]
                this.data[dragEndSection].splice(dragEndIndex, 0, item)
                this.importData()

                this.importData()
            })
        })

        const dragoverHandler = (e) => {
            e.preventDefault()
            const dragging = this.element.querySelector(`.${draggingClass}`)
            if (!dragging) return

            const afterElement = this.elementAfterMouse(components, e.clientY, draggingClass).element
            const beforeElement = this.elementBeforeMouse(components, e.clientY, draggingClass).element

            // BEWARE OF CONFUSING AS HECK DRAG AND DROP CALCULATIONS
            if (afterElement) {
                if (beforeElement && this.getElementIndex(beforeElement.parentNode, 1) !== dragStartSection && this.getElementIndex(afterElement.parentNode, 1) !== dragStartSection)
                    sections[this.getElementIndex(beforeElement.parentNode, 1)].appendChild(dragging)
                else if (!beforeElement && this.getElementIndex(afterElement.parentNode, 1) !== dragStartSection) { 
                    sections[this.getElementIndex(afterElement.parentNode, 1)].appendChild(dragging)
                }
                else {
                    if (this.getElementIndex(afterElement.parentNode, 1) !== dragStartSection)
                        sections[dragStartSection].appendChild(dragging)
                    else
                        sections[dragStartSection].insertBefore(dragging, afterElement)
                }
            }
            else
                sections[this.getElementIndex(beforeElement.parentNode, 1)].appendChild(dragging)
        }
        sections.forEach(section => {
            section.removeEventListener("dragover", this.componentDragHandler)
            section.addEventListener("dragover", dragoverHandler)
        })
        this.componentDragHandler = dragoverHandler
    }
    elementAfterMouse(elements, y, draggingClass) {
        elements = elements.filter(element => !element.classList.contains(draggingClass))

        const resultElement = elements.reduce((result, element) => {
            const boundingBox = element.getBoundingClientRect()
            const offset = y - (boundingBox.y + boundingBox.height / 2)
            if (offset < 0 && offset > result.offset)
                return {
                    offset: offset, element: element
                }
            else
                return result
        }, { offset: Number.NEGATIVE_INFINITY })

        return resultElement
    }
    elementBeforeMouse(elements, y, draggingClass) {
        elements = elements.filter(element => !element.classList.contains(draggingClass))

        const resultElement = elements.reduce((result, element) => {
            const boundingBox = element.getBoundingClientRect()
            const offset = y - (boundingBox.y + boundingBox.height / 2)
            if (offset > 0 && offset < result.offset)
                return {
                    offset: offset, element: element
                }
            else
                return result
        }, { offset: Number.POSITIVE_INFINITY })

        return resultElement
    }

    saveElements(type, value) {
        const select = this.popup.querySelector(".headlessCMS-popup-body-select")

        if (select.disabled) {
            this.data[this.popupIndex][this.getElementIndex(this.activeComponent, 2)].value = value
        }
        else {
            this.data[this.popupIndex].push(
                {
                    type: type,
                    value: value
                }
            )
        }
        this.importData()
    }
    setDataTypes() {
        this.dataTypes = [
            {
                type: "h2",
                value: "Main Header"
            },
            {
                type: "h3",
                value: "Secondary Header"
            },
            {
                type: "p",
                value: "Paragraph"
            },
            {
                type: "ul",
                value: "Bullet List"
            }
        ]
    }
    renderElements(element) {
        const node = document.createElement(element.type)
        node.textContent = element.value

        if (element.type === "ul" || element.type === "ol") {
            node.textContent = ""

            const listValues = element.value.split(/\r?\n/);

            listValues.forEach(value => {
                const li = document.createElement("li")
                li.textContent = value
                node.appendChild(li)
            })
        }

        return node
    }

    enableEdit() {
        this.editEnabled = true
        this.importData()
    }
    disableEdit() {
        this.editEnabled = false
        this.importData()
    }



















}