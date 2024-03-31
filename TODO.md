# To be done:

## controller.js

## users.js

## utils.js

## REVIEW from V1

## auth.unit.test.js

    - register
    - registerAdmin
    - login
    - logout

## controller.unit.test.js

    - createCategory
    - updateCategory
    - deleteCategory
    - getCategories
    - createTransaction
    - getAllTransactions
    - getTransactionsByUser
    - getTransactionsByUserByCategory
    - getTransactionsByGroup
    - getTransactionsByGroupByCategory
    - deleteTransaction
    - deleteTransactions

## users.unit.test.js

    - getUser
    - createGroup
    - getGroups
    - addToGroup
    - removeFromGroup
    - deleteUser
    - deleteGroup

## utils.unit.test.js

    - handleDateFilterParams
    - verifyAuth
    - handleAmountFilterParams

## auth.integration.test.js

    - register
    - registerAdmin
    - login
    - logout

## controller.integration.test.js

    - createCategory
    - updateCategory
    - deleteCategory
    - getCategories
    - createTransaction
    - getTransactionByUser
    - getTransactionByUserByCategory
    - getTransactionsByGroup
    - getTransactionsByGroupByCategory
    - deleteTransaction
    - deleteTransactions

## users.integration.test.js

    - getUser
    - createGroup
    - getGroups
    - getGroup
    - addToGroup
    - removeFromGroup
    - deleteUser
    - deleteGroup

## utils.integration.test.js

    - handleDateFilterParams
    - verifyAuth
    - handleAmountFilterParams

# In progress:

# To be tested:

| Code | Function                         | Reviewer | Unit test |
| ---- | -------------------------------- | -------- | --------- |
| G    | register                         | A        | L         |
| G    | createCategory                   | A        | L         |
| G    | getUsers                         | A        | L         |
| G    | updateCategory                   | A        | L         |
| G    | deleteCategory                   | A        | L         |
| G    | getTransactionsByUser            | A        | L         |
| G    | getTransactionsByUserByCategory  | A        | L         |
|      |                                  |
| g    | createGroup                      | G        | A         |
| g    | deleteTransactions               | G        | A         |
| g    | registerAdmin                    | G        | A         |
| g    | getCategories                    | G        | A         |
| g    | getTransactionsByGroup           | G        | A         |
| g    | getTransactionsByGroupByCategory | G        | A         |
| g    | getAllTransactions               | G        | A         |
|      |                                  |
| L    | deleteGroup                      | g        | G         |
| L    | deleteUser                       | g        | G         |
| L    | deleteTransaction                | g        | G         |
| L    | handleDateFilterParams           | g        | G         |
| L    | handleAmountFilterParams         | g        | G         |
| L    | logout                           | g        | G         |
|      |                                  |
| A    | getGroups                        | L        | g         |
| A    | getGroup                         | L        | g         |
| A    | addToGroup                       | L        | g         |
| A    | removeFromGroup                  | L        | g         |
| A    | getUser                          | L        | g         |
| A    | createTransaction                | L        | g         |
| A    | login                            | L        | g         |

# Completed:
