# Menwoman.ru

Independent static deployment of the festival website.

## Tuqo preview

In the Tuqo panel, open the site `menwomanspb.tuqo.ru` and copy its **Forms → Form endpoint** URL (`https://api.tuqo.ru/f/<site_id>`). Build the static archive with that public URL:

```sh
NEXT_PUBLIC_TUQO_FORM_ENDPOINT='https://api.tuqo.ru/f/<site_id>' npm run build:static
```

Zip the **contents** of `out/` so that `index.html` is at the ZIP root, then upload the ZIP to the Tuqo site. Tuqo stores accepted applications in **Forms**. To receive them at `aopetrukhin@gmail.com`, enable **Forms → Доставка заявок → email** for that address and complete Tuqo's confirmation if requested. A site ZIP cannot enable email delivery on its own.

Test one application from the published `menwomanspb.tuqo.ru` origin, confirm it appears in Tuqo Forms, and confirm the email arrives. The static preview routes approved promo codes to the organizer by email until a ticket checkout backend is connected. The `/gifts/` route is unchanged.
