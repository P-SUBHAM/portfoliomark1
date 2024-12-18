$(document).ready(function() {
    // Prevent double form submission
    $('.todo-form').on('submit', function() {
        $(this).find('button[type="submit"]').prop('disabled', true);
    });

    // Edit todo
    $('.edit-todo').on('click', function(e) {
        e.preventDefault();
        const todoItem = $(this).closest('.todo-item');
        const todoContent = todoItem.find('.todo-content');
        const currentText = todoContent.text();

        // Create input field
        const input = $('<input>')
            .attr('type', 'text')
            .addClass('edit-input form-control')
            .css({
                'background-color': 'var(--card-background)',
                'color': 'var(--text-color)'
            })
            .val(currentText);

        // Replace content with input
        todoContent.html(input);
        todoItem.addClass('editing');
        input.focus();

        // Handle input blur
        input.on('blur', function() {
            const newText = $(this).val().trim();
            if (newText && newText !== currentText) {
                // Here you would typically make an AJAX call to update the todo
                todoContent.text(newText);
            } else {
                todoContent.text(currentText);
            }
            todoItem.removeClass('editing');
        });

        // Handle enter key
        input.on('keypress', function(e) {
            if (e.which === 13) {
                $(this).blur();
            }
        });
    });

    // Handle checkbox change
    $('.todo-checkbox').on('change', function() {
        const todoId = $(this).data('id');
        const completed = $(this).is(':checked');
        $.post(`/toggle/${todoId}`, { completed: completed }, function(response) {
            if (response.status === 'success') {
                const todoContent = $(`.todo-item[data-id="${todoId}"] .todo-content`);
                if (completed) {
                    todoContent.addClass('text-decoration-line-through');
                } else {
                    todoContent.removeClass('text-decoration-line-through');
                }
            }
        });
    });

    // Remove delete confirmation
    $('.delete-todo').off('click');
});
