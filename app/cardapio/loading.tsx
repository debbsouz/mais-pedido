export default function CardapioLoading() {
  const placeholderRows = Array.from(
    { length: 6 },
  );

  const placeholderCategories = Array.from(
    { length: 5 },
  );

  return (
    <section
      className="menu-admin"
      aria-hidden="true"
    >
      <header className="menu-admin__header">
        <div>
          <span
            className="skeleton"
            style={{
              width: 140,
              height: 12,
            }}
          />

          <h1>
            <span
              className="skeleton"
              style={{
                width: 220,
                height: 30,
                marginTop: 8,
              }}
            />
          </h1>

          <p>
            <span
              className="skeleton"
              style={{
                width: 320,
                height: 14,
                marginTop: 8,
              }}
            />
          </p>
        </div>

        <span
          className="skeleton"
          style={{
            width: 150,
            height: 46,
            borderRadius: 12,
          }}
        />
      </header>

      <div className="menu-admin__toolbar">
        <span
          className="skeleton"
          style={{
            height: 46,
            borderRadius: 12,
          }}
        />

        <span
          className="skeleton"
          style={{
            width: 170,
            height: 46,
            borderRadius: 12,
          }}
        />

        <span
          className="skeleton"
          style={{
            width: 110,
            height: 46,
            borderRadius: 12,
          }}
        />
      </div>

      <div className="menu-admin__categories">
        {placeholderCategories.map(
          (_, index) => (
            <span
              key={index}
              className="skeleton"
              style={{
                width: 92,
                height: 38,
                flexShrink: 0,
                borderRadius: 999,
              }}
            />
          ),
        )}
      </div>

      <div className="menu-admin__content">
        {placeholderRows.map(
          (_, index) => (
            <div
              key={index}
              className="menu-admin-product"
            >
              <div className="menu-admin-product__main">
                <span
                  className="skeleton"
                  style={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    borderRadius: 12,
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    minWidth: 0,
                    gap: 6,
                  }}
                >
                  <span
                    className="skeleton"
                    style={{
                      width: 160,
                      height: 14,
                    }}
                  />

                  <span
                    className="skeleton"
                    style={{
                      width: 220,
                      height: 12,
                    }}
                  />
                </div>
              </div>

              <span
                className="skeleton"
                style={{
                  width: 80,
                  height: 12,
                }}
              />

              <span
                className="skeleton"
                style={{
                  width: 60,
                  height: 14,
                }}
              />

              <span
                className="skeleton"
                style={{
                  width: 100,
                  height: 14,
                }}
              />

              <span
                className="skeleton"
                style={{
                  width: 70,
                  height: 30,
                  borderRadius: 8,
                }}
              />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
