## Tests

Here are some test cases for the code snippet:

- Test case 1:
  - Input: 
    ```js
    import {
      observeActiveEditorsDebounced,
      editorChangesDebounced
    } from './debounced';;
    ```
  - Output: 
    ```markdown
    error: Insert `,` (prettier/prettier) at pkg/commons-atom/ActiveEditorRegistry.js:22:25:
      20 | import {
      21 |   observeActiveEditorsDebounced,
    > 22 |   editorChangesDebounced
         |                         ^
      23 | } from './debounced';;
      24 |
      25 | import {observableFromSubscribeFunction} from '../commons-node/event';
    ```

- Test case 2:
  - Input: 
    ```js
    import {
      observeActiveEditorsDebounced,
      editorChangesDebounced
    } from './debounced';;
    ```
  - Output: 
    ```markdown
    error: Delete `;` (prettier/prettier) at pkg/commons-atom/ActiveEditorRegistry.js:23:21:
      21 |   observeActiveEditorsDebounced,
      22 |   editorChangesDebounced
    > 23 | } from './debounced';;
         |                     ^
      24 |
      25 | import {observableFromSubscribeFunction} from '../commons-node/event';
      26 | import {cacheWhileSubscribed} from '../commons-node/observable';
    ```

These test cases cover the scenarios where the code violates the Prettier formatting rules and generates lint errors.