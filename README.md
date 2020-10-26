# HeadlessCMS
A small content management library that enables you to have user interaction in your web page.

This is not a full blown CMS, it is merely an experiment that has drag and drop sorting and managing functionality.

## Demo
Click [here](https://ozturkkl.github.io/HeadlessCMS/demo/index.html) to view the demo.

## Usage
Download these files [source file](https://raw.githubusercontent.com/ozturkkl/HeadlessCMS/master/dist/headlessCMS.js), [css file](https://raw.githubusercontent.com/ozturkkl/HeadlessCMS/master/dist/headlessCMS.css) and include it in your project.

Also, check out [exampleData](https://raw.githubusercontent.com/ozturkkl/HeadlessCMS/master/demo/exampleDatabase.js) for the example layout data that was used to create the demo.

```html
<link rel="stylesheet" href="headlessCMS.css">
<script src="headlessCMS.js"></script>
```

### Initialization
To initialize an instance call the constructor and pass in a div element from the DOM, you can also give it a [data](https://raw.githubusercontent.com/ozturkkl/HeadlessCMS/master/demo/exampleDatabase.js) array that containes a pre-built layout (optional):
```js
const headlessCMS = new HeadlessCMS("#headlessCMS", exampleData);
```

## Attributes
| Attribute | Type | Explanation |
| --- | --- | --- |
| .elementSelector | **String** | Containes the original selector that was provided when creating the object. |
| .element | **DOM Object** | Containes the original element that was provided when creating the object. |
| .editEnabled | **Boolean** | Containes a boolean value, will be true when edit mode is enabled and false when edit mode is disabled. |


## Methods
.importData(\[data\]) --> Takes in the data that is provided and sets the state of the CMS to that. The data should be exported from the object or should have the structure that is provided in the [exampleData](https://raw.githubusercontent.com/ozturkkl/HeadlessCMS/master/demo/exampleDatabase.js). Defaults to []
```js
headlessCMS.importData([
    [
        {
            type: "h2",
            value: "This Is a Big Header"
        },
        {
            type: "h3",
            value: "This Is a Small Header"
        },
        {
            type: "ul",
            value: 'This is an example unordered list entry \n This is another example entry \n This is yet another example list entry'
        },
        {
            type: "p",
            value: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minima exercitationem similique tempore vero molestias officia consequuntur eum rerum neque autem nulla, corporis dolores! Similique ut molestiae vitae, reiciendis non dolorem.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minima exercitationem similique tempore vero molestias officia consequuntur eum rerum neque autem nulla, corporis dolores! Similique ut molestiae vitae, reiciendis non dolorem."
        },
        {
            type: "ul",
            value: 'This is an example unordered list entry \n This is another example entry \n This is yet another example list entry'
        },
    ],
    [
        {
            type: "p",
            value: "Thank you for checking out this library!"
        }
    ]
])
```

.exportData() --> Exports the current state of the CMS as an array. This object should be saved to the database and should be fetched and imported to the headlessCMS object every time the page is refreshed.
```js
console.log(headlessCMS.exportData())

// Will print the data array.
```

.enableEdit() --> Will enable edit mode for the CMS.
.disableEdit() --> Will disable edit mode for the CMS.
Edit mode allows users to add new components and drag and drop elements to customize the content. A button can toggle between these mods.
```js
function editButtonClick() {
    if (headlessCMS.editEnabled) {
        headlessCMS.disableEdit()
        alert("Look at the console for the object for the content!")
        console.log(headlessCMS.exportData())
    }
    else {
        headlessCMS.enableEdit()
        headlessCMS.importData(exampleData)
    }
}
```

## License
This project is licensed under the MIT License.
