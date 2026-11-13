# Menwoman.ru

Independent static deployment of the festival website.

## Tuqo preview

The Tuqo **Forms → Form endpoint** for `menwomanspb.tuqo.ru` is public and has been confirmed to allow this origin. Build the static archive with it:

```sh
NEXT_PUBLIC_TUQO_FORM_ENDPOINT='https://api.tuqo.ru/f/989e956d-0cb6-4d4d-accd-5537e51e78b3' npm run build:static
```

Zip the **contents** of `out/` so that `index.html` is at the ZIP root, then upload the ZIP to the Tuqo site. Tuqo stores accepted applications in **Forms**. To receive them at `aopetrukhin@gmail.com`, enable **Forms → Доставка заявок → email** for that address and complete Tuqo's confirmation if requested. A site ZIP cannot enable email delivery on its own.

Test one application from the published `menwomanspb.tuqo.ru` origin, confirm it appears in Tuqo Forms, and confirm the email arrives. The static preview routes approved promo codes to the organizer by email until a ticket checkout backend is connected. The `/gifts/` route is unchanged.
