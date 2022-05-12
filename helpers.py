import random

# This will break when there's more than 999 connections
# But it is done just to show a cute number instead of session id
def generate_chat_user_number(chat_users):
    num = random.randint(1, 999)
    while num in chat_users.values():
        num = random.randint(1, 999)

    return num

def get_user_color(user_display_id):
    if user_display_id < 200:
        return "#9876cc"
    elif user_display_id < 400:
        return "#eb0400"
    elif user_display_id < 600:
        return "#CD13A7"
    elif user_display_id < 800:
        return "#1FEAFF"
    else:
        return "#008080"